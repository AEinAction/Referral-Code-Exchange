@version 1


# Archethic Contract for Referral Codes Exchange





condition triggered_by: transaction, as: [

  address: (
    # Farm can only be created by the master chain of the dex

    # Transaction is not yet validated so we need to use previous address
    # to get the genesis address
    previous_address = Chain.get_previous_address(transaction)
    Chain.get_genesis_address(previous_address) == "{{owner}}"
  )
]



actions triggered_by: transaction do
  types = State.get("types", [])
  types = List.prepend(types, new_farm)
  State.set("types", types)
end


export fun function_name() do
 State.get("types", [])
end

# Add Codes Function entry

condition triggered_by: transaction, on: addCodes(code1,code2,code3), as: [
    content: true

]

actions triggered_by: transaction, on: addCodes(code1,code2,code3) do
  Contract.set_type "token"

  collection_1 = ""
  collection_2 = ""
  collection_3 = ""
  nb = "100000000"
  if (code1 != "") do
        nb = "100000000"
        collection_1 = "{
            \\\"description\\\": \\\"Code Parrainage Monerium\\\",
            \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
            \\\"type_mime\\\": \\\"image/jpeg\\\",
            \\\"content\\\": {
               \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
             },
             \\\"code\\\": \\\"#{code1}\\\"
       }"
  end

  if (code2 != "") do
      nb = "200000000"
      collection_2 = ",{
    \\\"description\\\": \\\"Code Parrainage Monerium\\\",
    \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
    \\\"type_mime\\\": \\\"image/jpeg\\\",
    \\\"content\\\": {
       \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
     },
     \\\"code\\\": \\\"#{code2}\\\"
}"

  end

  if (code3 != "") do
       nb = "300000000"
       collection_3 = ",{
    \\\"description\\\": \\\"Code Parrainage Monerium\\\",
    \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
    \\\"type_mime\\\": \\\"image/jpeg\\\",
    \\\"content\\\": {
       \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
     },
     \\\"code\\\": \\\"#{code3}\\\"
}"

  end

 # State.set("collection_1", collection_1)
 # State.set("collection_2", collection_2)
 # State.set("collection_3", collection_3)
 # State.set("nb", nb)


  Contract.set_content "{
    \\\"supply\\\":  #{nb},
    \\\"name\\\": \\\"Codes Parrainage Monerium\\\",
    \\\"type\\\": \\\"non-fungible\\\",
    \\\"symbol\\\": \\\"monerium-code\\\",
    \\\"properties\\\": {
        \\\"description\\\": \\\"Codes Parrainage Monerium\\\",
        \\\"content\\\": {
            \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
        },
        \\\"type_mime\\\": \\\"image/jpeg\\\",
        \\\"name\\\":  \\\"Codes Parrainage Monerium\\\"
   },
    \\\"collection\\\": [ #{collection_1}#{collection_2}#{collection_3} ],
    \\\"aeip\\\": [
      2,
      9
    ]
}"

end



# Transfer a Code to a Wallet

 condition triggered_by: transaction, on: transfer(), as: [
    content: (Map.size(contract.balance.tokens) > 0)
]

actions triggered_by: transaction, on: transfer() do
   t = ""
   i = 0

   Contract.set_type "transfer"

   if Map.size(contract.balance.tokens) > 0 do
            for pool_info in Map.keys(contract.balance.tokens) do
                t = pool_info.token_address
                i = pool_info.token_id
            end
   end
   Contract.add_token_transfer(
    to: transaction.address,
    amount: 1,
    token_id: i,
    token_address: t)

    State.set("debug", Map.size(contract.balance.tokens))

  #  State.set("debug2", i)
   #  State.set("debug", t)

end



# Add a Company

condition triggered_by: transaction, on: add_company(name), as: [
  content: true
]

actions triggered_by: transaction, on: add_company(name) do
  address=""
  token_address=""
  token_id=""
  id=""
end






# Test the Contract

condition triggered_by: transaction, on: debug(), as: [
  content: true
]

actions triggered_by: transaction, on: debug() do
  address=""
  token_address=""
  token_id=""
  id=""
end
