'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/auth'

export async function uploadFiles(formData: FormData) {
    const session = await auth()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }

    const files = formData.getAll('files') as File[]
    const uploadedFiles = []

    if (!files || files.length === 0) {
        return { error: 'No files provided' }
    }

    try {
        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uniqueName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const filePath = join(uploadDir, uniqueName)

            await writeFile(filePath, buffer)

            uploadedFiles.push({
                fileName: file.name,
                filePath: `/uploads/${uniqueName}`,
                fileType: file.type,
                fileSize: file.size
            })
        }

        return { success: true, files: uploadedFiles }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload files' }
    }
}
