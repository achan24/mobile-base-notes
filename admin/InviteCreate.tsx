"use client"
import { Create, SimpleForm, TextInput, SelectInput } from "react-admin"

export default function InviteCreate() {
  return (
    <Create title="Send Invite">
      <SimpleForm>
        <TextInput source="email" required />
        <SelectInput source="role" choices={[
          { id: "user",  name: "User"  },
          { id: "admin", name: "Admin" },
        ]} defaultValue="user" />
      </SimpleForm>
    </Create>
  )
}
