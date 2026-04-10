import { Link } from '@inertiajs/react'

const ACTION_VARIANTS = {
  primary: 'prism-button prism-button-primary',
  secondary: 'prism-button prism-button-secondary',
  danger: 'prism-button prism-button-danger',
  soft: 'prism-button prism-button-soft'
}

export function PageFrame({ children, wide = false, className = '' }) {
  return (
    <div className={`prism-app-bg py-8 ${className}`}>
      <div className={wide ? 'prism-page-wide' : 'prism-page'}>
        {children}
      </div>
    </div>
  )
}

export function PageSection({
  kicker,
  title,
  description,
  actions,
  children,
  className = '',
  surfaceClassName = '',
}) {
  return (
    <section className={className}>
      <SectionIntro
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
      />
      <SurfaceCard className={surfaceClassName}>
        {children}
      </SurfaceCard>
    </section>
  )
}

export function SectionIntro({ kicker, title, description, actions, className = '' }) {
  return (
    <div className={`prism-section-header ${className}`}>
      <div>
        {kicker && <p className="prism-kicker">{kicker}</p>}
        <h1 className="prism-title mt-2">{title}</h1>
        {description && <p className="prism-subtitle mt-3">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

export function SurfaceCard({ children, className = '', ...props }) {
  return (
    <section className={`prism-surface ${className}`} {...props}>
      {children}
    </section>
  )
}

export function CenteredPage({
  kicker,
  title,
  description,
  children,
  footer,
  className = '',
  surfaceClassName = '',
}) {
  return (
    <PageFrame className={className}>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center px-4 sm:px-6 lg:px-8">
        <SurfaceCard className={`w-full p-6 sm:p-8 ${surfaceClassName}`}>
          <div className="space-y-8">
            {(kicker || title || description) && (
              <div>
                {kicker && <p className="prism-kicker">{kicker}</p>}
                {title && <h1 className="prism-title mt-2">{title}</h1>}
                {description && <p className="prism-subtitle mt-3">{description}</p>}
              </div>
            )}

            <div>{children}</div>

            {footer && (
              <div className="border-t border-stone-200/80 pt-5 text-center">
                {footer}
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <article className={`prism-card ${className}`} {...props}>
      {children}
    </article>
  )
}

export function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`prism-empty ${className}`}>
      <p className="text-stone-600">{title}</p>
      {description && <p className="mt-3 text-sm leading-7 text-stone-400">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function ActionLink({ href, variant = 'secondary', className = '', children, ...props }) {
  return (
    <Link href={href} className={`${ACTION_VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </Link>
  )
}

export function ActionButton({ variant = 'secondary', className = '', children, ...props }) {
  return (
    <button type="button" className={`${ACTION_VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function DefinitionList({ items, className = '' }) {
  return (
    <dl className={`prism-definition-grid ${className}`}>
      {items.map((item) => (
        <div key={item.label} className={item.className || ''}>
          <dt className="prism-definition-term">{item.label}</dt>
          <dd className="prism-definition-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
