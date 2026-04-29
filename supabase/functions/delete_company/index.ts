import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface DeleteCompanyRequest {
  company_id: string;
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { company_id }: DeleteCompanyRequest = await req.json();

    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: userCount, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('company_id', company_id);

    if (countError) {
      console.error('Error counting users:', countError);
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deletedUsersCount = userCount?.length || 0;

    if (deletedUsersCount > 0) {
      const { error: deleteProfilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('company_id', company_id);

      if (deleteProfilesError) {
        console.error('Error deleting company profiles:', deleteProfilesError);
        return new Response(JSON.stringify({ error: deleteProfilesError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', company_id);

    if (deleteError) {
      console.error('Error deleting company:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deleted_users: deletedUsersCount,
      message: `Empresa e ${deletedUsersCount} usuário(s) excluídos com sucesso`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete company function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});