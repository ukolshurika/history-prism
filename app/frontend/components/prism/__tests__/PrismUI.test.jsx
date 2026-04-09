import { render, screen } from '@testing-library/react'
import { ActionButton, ActionLink, EmptyState, PageFrame, SectionIntro, SurfaceCard } from '../PrismUI'

jest.mock('@inertiajs/react', () => ({
  Link: ({ href, children, className, ...props }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}))

describe('PrismUI', () => {
  it('renders a page frame and surface card', () => {
    render(
      <PageFrame>
        <SurfaceCard>
          <div>Content</div>
        </SurfaceCard>
      </PageFrame>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Content').closest('.prism-surface')).toBeInTheDocument()
  })

  it('renders a section intro with actions', () => {
    render(
      <SectionIntro
        kicker="Kicker"
        title="Title"
        description="Description"
        actions={<ActionLink href="/test">Action</ActionLink>}
      />
    )

    expect(screen.getByText('Kicker')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Action' })).toHaveAttribute('href', '/test')
  })

  it('renders action button and empty state content', () => {
    render(
      <EmptyState
        title="Empty title"
        description="Empty description"
        action={<ActionButton>Do it</ActionButton>}
      />
    )

    expect(screen.getByText('Empty title')).toBeInTheDocument()
    expect(screen.getByText('Empty description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument()
  })
})
