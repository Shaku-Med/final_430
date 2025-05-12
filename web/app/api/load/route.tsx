import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Get the URL from the searchParams instead of splitting the path
        const { searchParams } = new URL(request.url);
        const targetUrl = searchParams.get('url');
        
        if (!targetUrl) {
            return NextResponse.json(
                { error: 'No URL provided' },
                { status: 400 }
            );
        }
        
        // Log the request for debugging
        console.log(`Fetching: ${targetUrl}`);
        
        // Fetch the file
        const response = await fetch(targetUrl, {
            // Optional: Add request headers if needed
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyMediaProxy/1.0)',
                // Add any other headers required by the target server
            }
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `Failed to fetch file: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }
        
        // Get the content type from the response headers
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        // Get the file data
        const data = await response.arrayBuffer();
        
        // Return the file with appropriate headers
        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': data.byteLength.toString(),
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            },
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}