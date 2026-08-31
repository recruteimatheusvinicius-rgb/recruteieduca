import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Building2, KeyRound, UserCheck, MessageCircle, Users,
} from 'lucide-react';

export const CriarConta = () => (
  <section className="container-app py-20">
    <div className="text-center max-w-xl mx-auto mb-12">
      <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
        Criar conta
      </h1>
      <p className="text-surface-500 dark:text-surface-300">
        A RecruteiEduca é um benefício do ecossistema Recrutei — o acesso é liberado para
        empresas que já usam o nosso ATS de recrutamento e seleção, não por cadastro direto aqui.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <Card className="p-7 text-center">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={22} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
          1. Sua empresa usa o ATS Recrutei
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-300">
          O acesso à RecruteiEduca já vem incluído para empresas com um plano ativo no
          sistema de recrutamento e seleção da Recrutei.
        </p>
      </Card>
      <Card className="p-7 text-center">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <KeyRound size={22} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
          2. O admin libera o acesso
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-300">
          O administrador da conta convida cada pessoa do time, que recebe um link para
          criar a própria senha.
        </p>
      </Card>
      <Card className="p-7 text-center">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <UserCheck size={22} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
          3. O time começa a aprender
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-300">
          Cursos, trilhas e certificados liberados na hora — sem custo adicional, direto
          pela conta da empresa.
        </p>
      </Card>
    </div>

    <Card className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-surface-800">
      <div className="text-center sm:text-left">
        <p className="font-semibold text-surface-900 dark:text-surface-100 mb-1">
          Ainda não é cliente do ATS Recrutei?
        </p>
        <p className="text-sm text-surface-500 dark:text-surface-300">
          Fale com a nossa equipe para conhecer o sistema e liberar a RecruteiEduca para o seu time.
        </p>
      </div>
      <Button onClick={() => window.Tawk_API?.toggle()} className="flex-shrink-0">
        <MessageCircle size={16} />
        Fale conosco
      </Button>
    </Card>

    <div className="flex items-center justify-center gap-2 mt-10 text-sm text-surface-400 dark:text-surface-500">
      <Users size={15} />
      Já tem uma conta liberada pela sua empresa?
      <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer">
        Entrar
      </Link>
    </div>
  </section>
);
