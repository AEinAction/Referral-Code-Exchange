@version 1

condition triggered_by: transaction, as: []
actions triggered_by: transaction do
  Contract.set_content "Hello world!"
end


 # condition triggered_by: transaction,   as: [
  #  address: (
    # Types can only be created by the contract chain

    # Transaction is not yet validated so we need to use previous address
    # to get the genesis address
     #previous_address = Chain.get_previous_address(transaction)
   # Chain.get_genesis_address(previous_address) == "{{address}}"
  #   )
 #]

 #actions triggered_by: transaction,   do
   # # types = State.get("types", [])
   # types = List.prepend(types, new_type)
   # State.set("types", types)
 #end

 #export fun function_name() do
  #State.get("types", [])
 #end
