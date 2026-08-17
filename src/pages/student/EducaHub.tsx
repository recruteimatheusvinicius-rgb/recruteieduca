import { Card } from '../../components/ui/Card';
import type { LucideIcon } from 'lucide-react';
import { Video, Zap, FileText } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const ComingSoonPage = ({ title, description, icon: Icon }: ComingSoonProps) => (
  <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
    <div className="container-app py-16">
      <Card className="max-w-lg mx-auto p-10 text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">{title}</h1>
        <p className="text-surface-500 dark:text-surface-300">{description}</p>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-4">Em breve por aqui.</p>
      </Card>
    </div>
  </div>
);

export const Webinars = () => (
  <ComingSoonPage
    title="Webinars"
    description="Transmissões ao vivo e gravadas com especialistas em recrutamento e educação corporativa."
    icon={Video}
  />
);

export const Pilulas = () => (
  <ComingSoonPage
    title="Pílulas"
    description="Conteúdos curtos e direto ao ponto para aprender rápido no seu dia a dia."
    icon={Zap}
  />
);

export const Materiais = () => (
  <ComingSoonPage
    title="Materiais"
    description="Guias, templates e e-books para apoiar sua rotina de recrutamento."
    icon={FileText}
  />
);
