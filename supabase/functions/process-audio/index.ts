// supabase/functions/process-audio/index.ts
// ─────────────────────────────────────────────────────────────────────────────
//  Edge Function: se dispara cuando se inserta un recording con status=pending
//  1. Descarga el .ogg de Storage
//  2. Transcribe con Whisper
//  3. Analiza con GPT-4o
//  4. Guarda resultados en tabla analysis
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { recording_id } = await req.json();
    if (!recording_id) throw new Error("recording_id es requerido");

    // ── Clientes ──────────────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    // ── 1. Obtener recording ──────────────────────────────────────────────────
    const { data: rec, error: recErr } = await supabase
      .from("recordings")
      .select("*")
      .eq("id", recording_id)
      .single();
    if (recErr) throw recErr;

    // Marcar como processing
    await supabase
      .from("recordings")
      .update({ status: "processing" })
      .eq("id", recording_id);

    // ── 2. Descargar audio de Storage ─────────────────────────────────────────
    const { data: fileData, error: storErr } = await supabase.storage
      .from("recordings")
      .download(rec.storage_path);
    if (storErr) throw storErr;

    // ── 3. Transcribir con Whisper ────────────────────────────────────────────
    const formData = new FormData();
    formData.append("file", new Blob([await fileData.arrayBuffer()], { type: "audio/ogg" }), rec.filename);
    formData.append("model", "whisper-1");
    formData.append("language", "es");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities[]", "segment");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: formData,
    });
    if (!whisperRes.ok) throw new Error(`Whisper error: ${await whisperRes.text()}`);
    const whisperData = await whisperRes.json();

    const fullText = whisperData.text;
    const segments = whisperData.segments ?? [];

    // Convertir segmentos a formato transcript con speakers alternados
    const transcript = segments.map((s: any, i: number) => ({
      speaker: i % 2 === 0 ? "Agente" : "Cliente",
      text: s.text.trim(),
      start_sec: Math.round(s.start),
      end_sec: Math.round(s.end),
    }));

    // ── 4. Analizar con GPT-4o ────────────────────────────────────────────────
    const gptPrompt = `Eres un sistema de speech analytics para call centers. Analiza la siguiente transcripción de una llamada de servicio al cliente y devuelve un JSON con exactamente esta estructura (sin texto adicional, solo JSON válido):

{
  "sentiment_pos": <número 0-100>,
  "sentiment_neu": <número 0-100>,
  "sentiment_neg": <número 0-100>,
  "score_satisfaction": <número 0-100>,
  "score_clarity": <número 0-100>,
  "score_empathy": <número 0-100>,
  "score_resolution": <número 0-100>,
  "score_compliance": <número 0-100>,
  "keywords": ["palabra1", "palabra2", ...],
  "topics": ["tema1", "tema2", ...],
  "talk_ratio_agent": <número 0-100>,
  "talk_ratio_client": <número 0-100>,
  "interruptions": <número entero>,
  "long_silences": <número entero>,
  "alerts": ["alerta1", ...],
  "nps_score": <número 0-100>,
  "compliance_items": {
    "saludo_apertura": <true|false>,
    "verificacion_identidad": <true|false>,
    "lectura_script_legal": <true|false>,
    "ofrecimiento_ayuda": <true|false>,
    "cierre_correcto": <true|false>,
    "encuesta_satisfaccion": <true|false>
  },
  "agent_name": "<nombre detectado o 'Agente'>",
  "duration_sec": <número estimado en segundos>
}

TRANSCRIPCIÓN:
${fullText}`;

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: gptPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });
    if (!gptRes.ok) throw new Error(`GPT error: ${await gptRes.text()}`);
    const gptData = await gptRes.json();
    const ai = JSON.parse(gptData.choices[0].message.content);

    // ── 5. Guardar en BD ──────────────────────────────────────────────────────
    const { error: analysisErr } = await supabase.from("analysis").insert({
      recording_id,
      transcript,
      sentiment_pos: ai.sentiment_pos,
      sentiment_neu: ai.sentiment_neu,
      sentiment_neg: ai.sentiment_neg,
      score_satisfaction: ai.score_satisfaction,
      score_clarity: ai.score_clarity,
      score_empathy: ai.score_empathy,
      score_resolution: ai.score_resolution,
      score_compliance: ai.score_compliance,
      keywords: ai.keywords,
      topics: ai.topics,
      talk_ratio_agent: ai.talk_ratio_agent,
      talk_ratio_client: ai.talk_ratio_client,
      interruptions: ai.interruptions,
      long_silences: ai.long_silences,
      alerts: ai.alerts,
      nps_score: ai.nps_score,
      compliance_items: ai.compliance_items,
    });
    if (analysisErr) throw analysisErr;

    // Actualizar recording como done
    await supabase
      .from("recordings")
      .update({
        status: "done",
        agent_name: ai.agent_name,
        duration_sec: ai.duration_sec,
      })
      .eq("id", recording_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("process-audio error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
