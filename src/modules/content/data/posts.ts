import type { BlogPost } from '@/modules/content/types/cms'
import { postsPartOne } from '@/modules/content/data/postsPartOne'
import { postsPartTwo } from '@/modules/content/data/postsPartTwo'
import { postsPartThree } from '@/modules/content/data/postsPartThree'

export const postsSeed: BlogPost[] = [...postsPartOne, ...postsPartTwo, ...postsPartThree]
