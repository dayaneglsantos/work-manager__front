const handleEscKey = (event: KeyboardEvent, close: () => void) => {
  if (event.key === 'Escape') {
    close()
  }
}

export default handleEscKey
