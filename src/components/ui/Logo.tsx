export const BRAND_COLOR = '#4169E1';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export const LogoMark = ({ size = 36, className = '' }: LogoMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="42" height="42" rx="8" fill={BRAND_COLOR} />
    <path
      d="M28.8734 25.3132C28.8877 20.3075 28.8648 15.2416 28.8105 10.2329C28.8019 9.50312 28.8105 8.29818 28.8219 7.44242C28.8276 6.84425 28.2867 6.40063 27.7257 6.54659C27.7257 6.54659 27.72 6.54659 27.7171 6.54659C25.3016 7.17053 22.6713 8.15508 20.27 8.93642C17.9918 9.6777 15.7165 10.4333 13.4411 11.1803C13.2637 11.249 13.1291 11.4207 13.1005 11.6125L13.1234 32.3282C13.1234 32.623 13.3123 32.8805 13.5842 32.9635L21.8499 35.4621C22.1447 35.5509 22.4395 35.3219 22.4395 35.0042L22.4566 14.4402L22.3135 14.1941L15.5362 12.4224L15.3759 12.2965L27.2249 8.42698V33.2154L23.424 32.6258V33.9366C24.7606 34.2343 25.6736 34.4118 28.2151 34.9527C28.3955 34.9899 28.9135 34.9613 28.8992 34.3116C28.8992 34.2372 28.8706 27.8719 28.8763 25.3104L28.8734 25.3132ZM20.4246 21.3636C21.3433 21.2004 21.7755 22.3996 21.0428 22.9234C20.7823 23.1094 20.4131 23.118 20.1412 22.9377C19.5631 22.5513 19.7634 21.4809 20.4246 21.3636Z"
      fill="white"
    />
  </svg>
);

interface LogoProps {
  /** Tamanho (px) do selo/ícone — o texto escala proporcionalmente a partir dele. */
  size?: number;
  /** 'onDark' para uso sobre fundos escuros/coloridos (ex: hero do login). */
  theme?: 'default' | 'onDark';
  className?: string;
}

export const Logo = ({ size = 36, theme = 'default', className = '' }: LogoProps) => {
  const recruteiColor = theme === 'onDark' ? 'text-white' : 'text-surface-900 dark:text-white';
  const educaColor = theme === 'onDark' ? 'text-white/70' : 'text-surface-500 dark:text-surface-400';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-[1.05]">
        <span
          className={`font-heading font-extrabold tracking-tight ${recruteiColor}`}
          style={{ fontSize: size * 0.44 }}
        >
          recrutei
        </span>
        <span
          className={`font-heading font-medium self-end ${educaColor}`}
          style={{ fontSize: size * 0.28, marginTop: -2 }}
        >
          Educa
        </span>
      </span>
    </span>
  );
};
