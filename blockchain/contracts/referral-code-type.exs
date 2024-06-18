@version 1


condition triggered_by: transaction, on: add_type(new_type),  as: [
  address: (
    # Types can only be created by the contract chain

    # Transaction is not yet validated so we need to use previous address
    # to get the genesis address
    previous_address = Chain.get_previous_address(transaction)
    Chain.get_genesis_address(previous_address) == "{{managerAddress}}"
   )
]

actions triggered_by: transaction, on: add_type(new_type)   do


  previous_address = Chain.get_previous_address(transaction)
  State.set("genesis_address", Chain.get_genesis_address(previous_address))


   types = State.get("types", [])
  types = List.prepend(types, new_type)
  State.set("types", types)
end

export fun function_name() do
  State.get("types", [])
end
