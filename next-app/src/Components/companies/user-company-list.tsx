import { getUserCompanies } from "@/app/actions/company-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import Link from "next/link"
import { Eye, PlusCircle, Edit3 } from "lucide-react" // Icons

export async function UserCompanyList() {
  const companies = await getUserCompanies()

  if (!companies || companies.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>My Companies</CardTitle>
          <CardDescription>You haven't registered any companies yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Start by creating your first company.</p>
          <Button asChild>
            <Link href="/companies/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Company
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Companies</CardTitle>
          <CardDescription>
            A list of all companies you have registered. Found {companies.length} companies.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/companies/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Company
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legal Name</TableHead>
                <TableHead>Trade Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Legal ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.legal_name}</TableCell>
                  <TableCell>{company.trade_name || "-"}</TableCell>
                  <TableCell>{company.company_type}</TableCell>
                  <TableCell>{company.legal_id}</TableCell>
                  <TableCell>
                    <Badge variant={company.active ? "default" : "destructive"}>
                      {company.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Placeholder for future actions */}
                    <Button variant="outline" size="sm" disabled>
                      {" "}
                      {/* Replace with Link or actual action */}
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      {" "}
                      {/* Replace with Link or actual action */}
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
