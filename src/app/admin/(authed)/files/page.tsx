import { ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { listFiles } from "@/app/actions/files";
import { FileUploader } from "@/components/admin/file-uploader";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const rows = await listFiles();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <div className="px-10 py-10 space-y-10">
      <AdminHeader
        tag="UPLOADED FILES"
        title="첨부 파일"
        meta={`03 / ${rows.length} FILES`}
      />

      {!blobReady && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <code>BLOB_READ_WRITE_TOKEN</code> 환경변수가 비어있어 업로드가 비활성화되어 있습니다.
          Vercel 대시보드에서 Blob 스토어를 연결한 뒤 토큰을 <code>.env.local</code>에 추가해 주세요.
        </div>
      )}

      <FileUploader disabled={!blobReady} />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          업로드된 파일이 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden border border-structural/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">URL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-structural/10">
                  <td className="px-4 py-3 font-mono text-xs text-structural/65">
                    {new Date(r.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase text-structural/65">
                    {r.kind}
                  </td>
                  <td className="px-4 py-3 text-structural">{r.filename}</td>
                  <td className="px-4 py-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80"
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
