'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Nav from "../Home/Nav/Nav";
import Logo from "../Home/Icons/Logo";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Footer from '../Home/Footer/Footer';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
  expertise: string[];
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchTeamMembers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/fetch?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch team members');
      }

      setTeamMembers(data.teamMembers);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(null)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchTeamMembers(newPage);
  };

  return (
    <>
      <Nav/>
      <div className="container mx-auto px-4 py-25">

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchTeamMembers()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">No Team Members Found</h2>
                <p className="text-muted-foreground">There are currently no team members to display.</p>
              </div>
            ) : (
              <>
              <div className="text-center mb-12 flex items-center flex-col gap-2">
                <h1 className="text-4xl font-bold mb-4">Our Team</h1>
                <Logo svgClassName="w-[100px] h-[100px]" pathClassName="fill-foreground"/>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Meet the passionate individuals behind our mission to transform education through technology.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback className="text-2xl">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-center">{member.name}</CardTitle>
                      <CardDescription className="text-center">{member.role}</CardDescription>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
              </>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </>
  );
} 