import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Video, Zap, FileText, Play, Download, Radio } from 'lucide-react';

const educaTabs = [
  { path: '/educa/webinars', label: 'Webinar', icon: Video },
  { path: '/educa/pilulas', label: 'Pílulas', icon: Zap },
  { path: '/educa/materiais', label: 'Materiais', icon: FileText },
];

interface EducaLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const EducaLayout = ({ eyebrow, title, subtitle, children }: EducaLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="container-app py-12">
          <span className="text-xs font-bold tracking-widest uppercase text-primary-200">{eyebrow}</span>
          <h1 className="text-3xl font-bold mt-2 mb-2">{title}</h1>
          <p className="text-primary-100 max-w-xl">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-16 z-10">
        <div className="container-app py-3 flex gap-2 flex-wrap">
          {educaTabs.map((tab) => {
            const active = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer border transition-colors ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
                    : 'text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container-app py-10">{children}</div>
    </div>
  );
};

const notifyComingSoon = () => toast('Em breve por aqui.');

const recordedWebinars = [
  { title: 'Recrutamento orientado a dados: métricas que importam', duration: '42 min', tag: 'Dados' },
  { title: 'Employer branding para atrair talentos', duration: '38 min', tag: 'Employer Branding' },
  { title: 'Entrevistas estruturadas: como aplicar', duration: '35 min', tag: 'Entrevistas' },
  { title: 'Onboarding remoto sem perder engajamento', duration: '40 min', tag: 'Onboarding' },
];

export const Webinars = () => (
  <EducaLayout
    eyebrow="+Educa"
    title="Webinars ao vivo e sob demanda"
    subtitle="Aprenda com especialistas em recrutamento e seleção, em transmissões ao vivo ou quando quiser."
  >
    <Card className="p-8 flex flex-col sm:flex-row items-center gap-7 mb-10">
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white flex-shrink-0">
        <Radio size={32} />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <Badge className="mb-2">Próximo webinar ao vivo</Badge>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Como reduzir o time-to-hire em processos seletivos
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">
          Terça, 26 de agosto · 15h · Equipe RecruteiEduca
        </p>
      </div>
      <Button onClick={notifyComingSoon} className="flex-shrink-0">Inscrever-se</Button>
    </Card>

    <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-5">Gravações</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {recordedWebinars.map((item) => (
        <Card key={item.title} padding="none" className="overflow-hidden cursor-pointer" onClick={notifyComingSoon}>
          <div className="aspect-video bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center relative">
            <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={18} className="text-primary-700 ml-0.5" />
            </div>
            <span className="absolute bottom-2 right-2.5 bg-surface-900/75 text-white text-xs px-2 py-0.5 rounded">
              {item.duration}
            </span>
          </div>
          <div className="p-4">
            <Badge className="mb-2">{item.tag}</Badge>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-snug">
              {item.title}
            </h4>
          </div>
        </Card>
      ))}
    </div>
  </EducaLayout>
);

const pills = [
  { title: '3 perguntas para toda entrevista comportamental', duration: '2 min', tag: 'Entrevistas' },
  { title: 'Como escrever uma vaga que atrai', duration: '3 min', tag: 'Vagas' },
  { title: 'Feedback pós-entrevista em 1 minuto', duration: '1 min', tag: 'Feedback' },
  { title: 'Reduza vieses na triagem', duration: '3 min', tag: 'Triagem' },
  { title: 'Checklist antes de fechar uma oferta', duration: '2 min', tag: 'Oferta' },
  { title: 'O que perguntar sobre soft skills', duration: '2 min', tag: 'Entrevistas' },
];

export const Pilulas = () => (
  <EducaLayout
    eyebrow="+Educa"
    title="Pílulas de conhecimento"
    subtitle="Conteúdos curtos e diretos para aprender em poucos minutos, no seu ritmo."
  >
    <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-5">Todas as pílulas</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {pills.map((item) => (
        <Card key={item.title} padding="none" className="overflow-hidden cursor-pointer" onClick={notifyComingSoon}>
          <div className="aspect-[3/4] bg-gradient-to-b from-primary-400 to-primary-700 flex items-center justify-center relative">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={15} className="text-primary-700 ml-0.5" />
            </div>
            <span className="absolute top-2 left-2 bg-surface-900/70 text-white text-[11px] px-1.5 py-0.5 rounded">
              {item.duration}
            </span>
          </div>
          <div className="p-3">
            <Badge className="mb-1.5">{item.tag}</Badge>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-snug">
              {item.title}
            </h4>
          </div>
        </Card>
      ))}
    </div>
  </EducaLayout>
);

const materials = [
  { title: 'Guia completo de onboarding', type: 'PDF', size: '1,2 MB', tag: 'Onboarding' },
  { title: 'Template de scorecard de entrevista', type: 'DOC', size: '340 KB', tag: 'Entrevistas' },
  { title: 'Checklist de processo seletivo', type: 'PDF', size: '210 KB', tag: 'Processo' },
  { title: 'E-book: recrutamento orientado a dados', type: 'EPUB', size: '2,4 MB', tag: 'Dados' },
  { title: 'Roteiro de entrevista estruturada', type: 'DOC', size: '180 KB', tag: 'Entrevistas' },
  { title: 'Guia de employer branding', type: 'PDF', size: '1,8 MB', tag: 'Employer Branding' },
];

export const Materiais = () => (
  <EducaLayout
    eyebrow="+Educa"
    title="Materiais para sua rotina"
    subtitle="Guias, templates e e-books prontos para usar no dia a dia de recrutamento."
  >
    <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-5">Todos os materiais</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {materials.map((item) => (
        <Card key={item.title} className="flex gap-4 items-start">
          <div className="w-11 h-11 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold">
            {item.type}
          </div>
          <div className="flex-1 min-w-0">
            <Badge className="mb-1.5">{item.tag}</Badge>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-snug mb-1">
              {item.title}
            </h4>
            <p className="text-xs text-surface-400 dark:text-surface-500 mb-3">{item.type} · {item.size}</p>
            <Button variant="secondary" size="sm" onClick={notifyComingSoon}>
              <Download size={14} />
              Baixar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  </EducaLayout>
);
