export default function Blog() {
  return (
    <div className="flex flex-col gap-2 md:gap-8 flex-grow w-full items-center p-2 md:p-5">
      <div className="max-w-[800px]">
        <article>
          <h2>Introduction to Web Development</h2>
          <p>
            Welcome to my blog! Are you curious about the exciting world of web
            development? Whether you're a seasoned coder or just getting
            started, this blog is here to guide you on your journey.
          </p>
          <p>
            In our posts, we'll cover everything from the basics of HTML and CSS
            to advanced JavaScript techniques. You'll also find tips on web
            design, responsive development, and the latest trends in the
            industry.
          </p>
          <blockquote>
            <p>"The web is constantly evolving, and so should your skills."</p>
            <footer>- Web Developer Pro</footer>
          </blockquote>
        </article>
      </div>
    </div>
  )
}
