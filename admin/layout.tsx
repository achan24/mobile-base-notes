"use client"
import { Admin, Resource, ListGuesser } from "react-admin"
import simpleRest from "ra-data-simple-rest"
import InviteCreate from "./InviteCreate"

export default function AdminLayout() {
  const dataProvider = simpleRest("/api/admin")
  return (
    <Admin dataProvider={dataProvider} title="Noteflow Admin">
      <Resource name="users"   list={ListGuesser} />
      <Resource name="invites" list={ListGuesser} create={InviteCreate} />
    </Admin>
  )
}
