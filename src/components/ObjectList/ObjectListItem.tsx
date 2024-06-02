import { iconForFile } from '@components/icons/File'
import type { AdminS3Object } from '@lib/types'

const FileListItem = ({ file }: { file: AdminS3Object }) => {
  const { id, mimeType, fileName, filePath } = file

  const Icon = iconForFile(mimeType)

  return (
    <div
      role="row"
      className="admin-list-row py-2 hover:bg-slate-100"
      key={[id, fileName, filePath].join('-')}
    >
      <Icon
        role="cell"
        ariaHidden={true}
        alt=""
        className="list-row-icon mx-2 h-6 w-6"
      />
      <div role="cell" className="admin-list-row-id">
        {id}
      </div>
      <div role="cell" className="admin-list-row-filename">
        {
          /** In order to have invisible row change possibility */
          fileName.replace(/_/g, '_\u200b')
        }
      </div>
      <div role="cell" className="admin-list-row-filepath">
        {
          /** In order to have invisible row change possibility */
          filePath.replace(/_/g, '-\u200b')
        }
      </div>
    </div>
  )
}

export default FileListItem
