"use client";

import React from 'react'
import Markdown from 'react-markdown'
import YouTube from 'react-youtube'

const opts = {
    playerVars: {
      autoplay: 0,
    },
}

const ChapterContent = ({chapter, content}) => {
  // Verificar que tenemos contenido válido y acceder al array de contenido
  const contentItems = content?.content || [];

  return (
    <div className='p-4 md:p-10 max-h-screen overflow-y-auto'>
      <h2 className='font-medium text-2xl mb-4 text-gray-900'>{chapter?.name}</h2>

      {/* Video */}
      {content?.videoId && (
        <div className='mt-5 mb-8'>
          <div className='max-w-3xl mx-auto aspect-video'>
            <YouTube
              videoId={content.videoId}
              opts={{
                ...opts,
                width: '100%',
                height: '100%',
              }}
              className="w-full h-full rounded-lg overflow-hidden shadow-lg"
              iframeClassName="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {contentItems.map((item, index) => (
          <div key={index} className='p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <h2 className='font-medium text-xl text-gray-900 mb-3'>{item.title}</h2>
            <div className='prose prose-slate max-w-none'>
              <Markdown>{item.description}</Markdown>
            </div>
            {item.codeExample && (
              <div className='mt-4 p-4 bg-gray-900 text-white rounded-md overflow-x-auto'>
                <pre className='text-sm'>
                  <code>
                    {item.codeExample.replace(/<\/?precode>/g, '')}
                  </code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChapterContent