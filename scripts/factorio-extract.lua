/silent-command
write_table = function (file_name, table_to_write)
	table.sort(table_to_write)
	output = "{\r\n\t" .. table.concat(table_to_write, ",\r\n\t") .. "\r\n}\r\n"
	game.write_file(file_name, output)
end

list_recipes = {}
for a, b in pairs(game.recipe_prototypes) do
	recipe = "\"" .. b.name .. "\": { \"energy\":" .. b.energy .. ", \"category\":\"" .. b.category .. "\""
	
	list_products = {}
	for c,d in pairs (b.products) do
		if d.amount ~= nil then
			table.insert(list_products, "{ \"" .. d.name .. "\":" .. d.amount .. " }")
		end
	end
	recipe = recipe .. ", \"products\": [ " .. table.concat(list_products, ", ") .. " ]"

	list_ingredients = {}
	for x,y in pairs (b.ingredients) do
		table.insert(list_ingredients, "{ \"" .. y.name .. "\":" .. y.amount .. " }")
	end
	recipe = recipe .. ", \"ingredients\": [ " .. table.concat(list_ingredients, ", ") .. " ] }"
	table.insert(list_recipes, recipe)
end
write_table("recipes.txt", list_recipes)


list_items = {}
for a, b in pairs(game.item_prototypes) do
	item = "\"" .. b.name .. "\": { }"
	table.insert(list_items, item)
end
write_table("items.txt", list_items)


list_fluids = {}
for a, b in pairs(game.fluid_prototypes) do
	fluid = "\"" .. b.name .. "\": { }"
	table.insert(list_fluids, fluid)
end
write_table("fluids.txt", list_fluids)


list_machines = {}
for a, b in pairs(game.entity_prototypes) do
	if b.crafting_categories then
		machine = "\"" .. b.name .. "\": { "

		list_categories = {}
		for c,d in pairs(b.crafting_categories) do
			table.insert(list_categories, c)
		end
		machine = machine .. "\"crafting_categories\": [ \"" .. table.concat(list_categories, "\", \"") .. "\" ] }"

		table.insert(list_machines, machine)
	end
end
write_table("machines.txt", list_machines)
