export async function loader() {
  const res = await fetch(
    'http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=c1e670aa50272d0fb69a8a3941c938cb36b9fd3a',
    {
      headers: {
        Accept: 'text/javascript',
      },
    }
  )
  return res.blob()
}
