import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Make sure these match your actual Appwrite environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'your-project-id';
    
    // The bucket and file IDs we set up in Steps 1 & 2
    const bucketId = '69c4b20d002fea80eab4'; 
    const fileId = 'aprovel-latest'; 
    
    // Construct the Appwrite file download URL.
    // We append a timestamp to ensure the browser fetches the newest file and ignores cache.
    // https://sgp.cloud.appwrite.io/v1/storage/buckets/69c4b20d002fea80eab4/files/aprovel-latest/view?project=698a9530001b36445667&mode=admin
    const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}&mode=admin`;

    // Redirect the user's browser to start the download
    return NextResponse.redirect(downloadUrl);
    
  } catch (error) {
    console.error("Failed to redirect to Appwrite APK", error);
    return NextResponse.redirect(
      new URL('/it-support', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    );
  }
}