import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"

interface User {
  firstname: string
  lastname: string
  name: string
  profile: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  image?: any
  description: string
  expertise: string[]
  information?: string
  created_at: string
  updated_at: string
  user_id: string
  users: User[]
}

interface TeamProps {
  data: TeamMember[]
  currentPage: number
  totalPages: number
}

const Team: React.FC<TeamProps> = ({ data, currentPage, totalPages }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Link href="/admin/dashboard/team/add">
          <Button className="">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Team Member
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-sm font-medium">No team members</h3>
          <p className="mt-1 text-sm">Get started by adding a new team member.</p>
          <div className="mt-6">
            <Link href="/admin/dashboard/team/add">
              <Button className="">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Team Member
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={member.users[0]?.profile || member.image} alt={member.name} />
                      <AvatarFallback className="text-2xl">
                        {member.users[0]?.firstname?.[0]}{member.users[0]?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-center">{member.users[0]?.name || member.name}</CardTitle>
                  <p className="text-center text-muted-foreground">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {member.information && (
                    <p className="mt-4 text-sm text-muted-foreground text-center">
                      {member.information}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  window.location.href = `/admin/dashboard/team?page=${page}`
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Team
