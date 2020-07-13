import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from "remark";
import * as html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'mock')

export function getSortedPostsData() {
    // 从mock目录取得mock文件
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map(fileName => {
        // 将文件名取出来作为数据的唯一id
        const id = fileName.replace(/\.md$/, '')

        // 将文件内容读出
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // 使用matter解析Markdown头部元数据
        const matterResult = matter(fileContents)

        // 将内容与id关联
        return {
            id,
            ...matterResult.data
        }
    })
    // 对文章内容按照时间排序
    return allPostsData.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory)

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map(fileName => {
        return {
            params: {
                id: fileName.replace(/\.md$/, '')
            }
        }
    })
}

export async function getPostData(id) {
    // 使用id拼接文件名
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // 使用matter解析Markdown头部元数据
    const matterResult = matter(fileContents)

    // 使用remark对内容进行渲染
    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const contentHtml = processedContent.toString()


    // 将内容与id关联
    return {
        id,
        contentHtml,
        ...matterResult.data
    }
}
