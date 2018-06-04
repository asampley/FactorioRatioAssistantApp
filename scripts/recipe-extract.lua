/silent-command
game.player.force.enable_all_recipes()
game.player.force.enable_all_technologies()
game.player.force.research_all_technologies(1)

listresources = {}
for a, b in pairs(game.player.force.recipes) do
	item = "{ name:" .. b.name .. ", energy:" .. b.energy .. ", category:" .. b.category .. ", group:" .. b.group.name
	
	listproducts = {}
	for c,d in pairs (b.products) do
		if d.amount ~= nil then
			table.insert(listproducts, "{ " .. d.name .. ":" .. d.amount .. " }")
		end
	end
	item = item .. ", products: [ " .. table.concat(listproducts, ", ") .. " ]"

	listingredients = {}
	for x,y in pairs (b.ingredients) do
		table.insert(listingredients, "{ " .. y.name .. ":" .. y.amount .. " }")
	end
	item = item .. ", ingredients: [ " .. table.concat(listingredients, ", ") .. " ] }"
	table.insert(listresources,item)
end
table.sort(listresources)
output = "[\r\n\t" .. table.concat(listresources, ",\r\n\t") .. "\r\n]\r\n"
game.write_file("recipies.txt", output)

