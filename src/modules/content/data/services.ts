import type { ServiceContent } from '@/modules/content/types/cms'
import { servicesPartOne } from '@/modules/content/data/servicesPartOne'
import { servicesPartTwo } from '@/modules/content/data/servicesPartTwo'

export const servicesSeed: ServiceContent[] = [...servicesPartOne, ...servicesPartTwo]
