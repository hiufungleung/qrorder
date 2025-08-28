import { NextRequest, NextResponse } from 'next/server'
import yaml from 'js-yaml'

export async function GET(request: NextRequest) {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const templatesDir = path.join(process.cwd(), 'public', 'templates')
    
    // Check if templates directory exists
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({
        status: 200,
        message: 'No templates available',
        data: []
      })
    }

    const files = fs.readdirSync(templatesDir)
    const templates = []

    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(templatesDir, file)
          const content = fs.readFileSync(filePath, 'utf8')
          const templateData = yaml.load(content) as any

          templates.push({
            id: path.basename(file, path.extname(file)),
            name: templateData.metadata?.name || 'Unnamed Template',
            description: templateData.metadata?.description || '',
            version: templateData.metadata?.version || '1.0.0',
            author: templateData.metadata?.author || 'Unknown',
            tags: templateData.metadata?.tags || [],
            created: templateData.metadata?.created || null,
            preview: {
              categoriesCount: templateData.categories?.length || 0,
              dishesCount: templateData.dishes?.length || 0,
              tablesCount: templateData.tables?.length || 0,
              sampleOrdersCount: templateData.sample_orders?.length || 0
            }
          })
        } catch (error) {
          console.error(`Error reading template ${file}:`, error)
          // Skip invalid template files
          continue
        }
      }
    }

    return NextResponse.json({
      status: 200,
      message: 'Templates retrieved successfully',
      data: templates
    })

  } catch (error) {
    console.error('Templates list error:', error)
    return NextResponse.json(
      { status: 500, message: 'Failed to retrieve templates' },
      { status: 500 }
    )
  }
}