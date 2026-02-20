import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
export const DataTable = ({ noticedata }) => {
    const notices = Array.isArray(noticedata?.notices) ? noticedata.notices : []

    return (

        <div className="overflow-auto h-full">
            <div className="notices-heading mx-3 my-2">
                <p className="min-[250px]:text-xl xl:text-3xl font-bold min-[250px]:text-center sm:text-start">Recent Notices</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Notice ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead className="text-right">Created By</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {notices.length === 0 ? (
                        <TableRow>
                            <TableCell className="text-center text-muted-foreground" colSpan={4}>
                                No recent notices available.
                            </TableCell>
                        </TableRow>
                    ) : notices.map((notice, index) => (
                        <TableRow key={notice._id || index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{notice?.title || "-"}</TableCell>
                            <TableCell>{notice?.audience || "-"}</TableCell>
                            <TableCell className="text-right">{`${notice?.createdby?.firstname || ""} ${notice?.createdby?.lastname || ""}`.trim() || "-"}</TableCell>
                        </TableRow>
                    ))}

                </TableBody>

                {/* <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
            </TableFooter> */}
            </Table>
        </div>
    )
}
