export const formatDate = (dateStr) => {
  
  // * dateStr = 2021-11-22

  // console.log("FORMAT DATE");

  const dateENG = new Date(dateStr)
  const dateFR = new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })

  // const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  // const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  // const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  // const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  // console.log(`${parseInt(da)} ${month.substr(0, 3)}. ${ye.toString().substr(2, 4)}`);
  
  return dateENG;
  // return dateFR;
  // ? return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}