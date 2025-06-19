interface CheckPermissionProps {
  name: string
}

export const getPermission = ({ name }: CheckPermissionProps) => {
  const storedSession = localStorage.getItem('session')
  const session = storedSession && JSON.parse(storedSession)

  const rolesList = session?.permissions

  const authorized = rolesList.find(
    (item: any) => item.name === name
  ).hasPermission

  return authorized
}
