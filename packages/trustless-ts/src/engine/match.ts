import { Resources, Actions } from '../access'

export function matchResources(o: Resources, n: Resources): boolean {
  if (o[0] === '*') {
    return true
  }

  return (
    n.filter(r => {
      return o.filter(or => or === r || toRegex(or).test(r)).length > 0
    }).length > 0
  )
}

export function matchActions(o: Actions, n: Actions): boolean {
  if (o[0] === '*') {
    return true
  }

  return (
    n.filter(a => {
      return o.filter(oa => oa === a || toRegex(oa).test(a)).length > 0
    }).length > 0
  )
}

function toRegex(str: string): RegExp {
  return new RegExp(str.replace(/\*/g, '(.*)'))
}
