export function ResponsiveEmbed({
  src,
  title,
  ratio = '16x9',
}: {
  src: string
  title: string
  ratio?: '16x9' | '4x3' | '1x1'
}) {
  return (
    <div className={`ratio ratio-${ratio}`}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allowFullScreen
        style={{ border: 0 }}
      />
    </div>
  )
}
