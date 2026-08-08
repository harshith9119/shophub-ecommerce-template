import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, subtitle, align = 'center', light = false }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const titleColor = light ? 'text-white' : 'text-emerald dark:text-gold-light';
  const subColor = light ? 'text-white/60' : 'text-subtle';

  return (
    <div className={`max-w-3xl mb-12 md:mb-16 ${alignClass}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.35em' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`luxury-subheading mb-5 ${light ? 'text-gold-light' : ''}`}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`luxury-heading ${titleColor} text-balance`}
      >
        {title}
      </motion.h2>
      <div className={`ornament-divider my-6 ${align === 'left' ? 'justify-start' : 'justify-center'}`}>
        <span className="ornament-diamond" />
      </div>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`font-light text-sm md:text-base leading-relaxed ${subColor} max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
