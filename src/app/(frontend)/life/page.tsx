import PageLayout from '@/components/layout/PageLayout'

export default function Life() {
  return (
    <PageLayout heading="Life">
      <figure className="flex md:hidden">
        <img
          src="/blog/life-cover-photo.webp"
          width={1400}
          height={934}
          className="w-full rounded-xl shadow-xl object-cover max-h-[400px]"
        />
      </figure>
      <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10">
        <div className="flex flex-col gap-6 basis-1/2">
          <h2 className="text-lg md:text-2xl font-semibold">About Me</h2>
          <div className="flex flex-col gap-4 leading-7">
            <p>
              I'm a stoked, driven, adventurous, and curious person. There are three major facets to
              me. There is the outdoor enthusiast, adventure-driven part of me that loves to ski,
              mountain bike, climb, run, backpack, and travel. There is the curious, maker part of
              me that loves to develop software (particularly web applications), build things, and
              try new hobbies. I especially like woodworking. The third part of me pervades the
              other two: a passion for life design.
            </p>
            <p>
              I'm intentional about how I spend my time and what's important in my life. I work
              towards long-term goals and build flexibility and joy into my life on a daily basis.
              Work is part of my life because I like what I do and I get to help other people
              achieve their dreams, their goals. Life design is about yourself and others.
            </p>
            <p>
              I lived in my van for over 4 years, traveling the country climbing, skiing, biking,
              hiking, and working as a freelance software engineer. Now I'm living in Bellingham,
              Washington and enjoying all that the PNW has to offer while still traveling a lot.
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-4 basis-1/2">
          <figure className="flex">
            <img
              src="/blog/life-cover-photo.webp"
              width={1400}
              height={934}
              className="w-full rounded-xl shadow-xl object-cover max-h-[400px]"
            />
          </figure>
          <figure className="h-[600px] w-full rounded-xl shadow-xl">
            <img
              src="/blog/waving.webp"
              width={1000}
              height={1333}
              className="w-full rounded-xl shadow-xl object-cover max-h-[600px]"
            />
          </figure>
        </div>
      </div>
      <figure className="md:hidden w-full rounded-xl shadow-xl">
        <img
          src="/blog/waving.webp"
          width={1000}
          height={1333}
          className="w-full rounded-xl shadow-xl object-cover max-h-[800px]"
        />
      </figure>
    </PageLayout>
  )
}
