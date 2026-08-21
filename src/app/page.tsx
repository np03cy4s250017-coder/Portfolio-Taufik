import { Hero } from '@/components/sections/hero'
import { Work } from '@/components/sections/work'
import { Skills } from '@/components/sections/skills'
import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Skills />
      <About />
      <Contact />
    </>
  )
}
