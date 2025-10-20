const modalStack: (() => void)[] = []

export const pushModal = (onClose: () => void) => {
  modalStack.push(onClose)
}

export const popModal = () => {
  modalStack.pop()
}

export const getTopModal = () => {
  return modalStack[modalStack.length - 1]
}
