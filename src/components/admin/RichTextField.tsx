import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

export function RichTextField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={MODULES}
      placeholder={placeholder}
    />
  )
}
