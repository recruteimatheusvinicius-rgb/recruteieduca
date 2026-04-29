import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string
  company: string
  role: 'student' | 'admin'
  inviteUrl: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { email, company, role, inviteUrl }: InviteRequest = await req.json()

    // Generate HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Convite para RecruteiEduca</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f1f14; margin: 0;">Recrutei<span style="color: #22c55e;">Educa</span></h1>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #0f1f14; margin-top: 0;">Você foi convidado!</h2>
            <p>Olá!</p>
            <p>Você foi convidado para fazer parte da plataforma <strong>RecruteiEduca</strong> pela empresa <strong>${company}</strong>.</p>
            <p>Como <strong>${role === 'admin' ? 'Administrador' : 'Estudante'}</strong>, você terá acesso a:</p>
            <ul style="padding-left: 20px;">
              <li>Cursos de alta qualidade</li>
              <li>Certificações reconhecidas</li>
              <li>Comunidade de profissionais</li>
              <li>Suporte personalizado</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Aceitar Convite
            </a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <p style="margin: 0; color: #92400e;">
              <strong>Importante:</strong> Este link é válido por 7 dias. Após esse período, você precisará solicitar um novo convite.
            </p>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>Se você não solicitou este convite, pode ignorar este e-mail.</p>
            <p>&copy; 2024 RecruteiEduca. Todos os direitos reservados.</p>
          </div>
        </body>
      </html>
    `

    // Send email using Supabase
    const { error } = await supabaseClient.functions.invoke('send_email', {
      body: {
        to: email,
        subject: `Convite para RecruteiEduca - ${company}`,
        html: emailHtml,
      },
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Convite enviado com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending invite:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao enviar convite' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})