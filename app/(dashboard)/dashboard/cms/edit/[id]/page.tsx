import CMSForm from '@/components/cms/CMSForm'

export default function EditCMSPage({ params }: { params: { id: string } }) {
  const articleId = params.id

  return <CMSForm mode="edit" articleId={articleId} />
}
