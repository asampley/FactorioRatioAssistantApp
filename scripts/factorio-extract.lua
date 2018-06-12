/silent-command
write_table = function (file_name, table_to_write)
	local output = '{\r\n\t' .. table.concat(table_to_write, ',\r\n\t') .. '\r\n}\r\n'
	game.write_file(file_name, output)
end


local list_recipes = {}
for a, b in pairs(game.recipe_prototypes) do
	local recipe = '"' .. b.name .. '": { "energy":' .. b.energy .. ', "category":"' .. b.category .. '"'
	
	local list_products = {}
	for c,d in pairs (b.products) do
		if d.amount ~= nil then
			table.insert(list_products, '"' .. d.name .. '":' .. d.amount)
		end
	end
	recipe = recipe .. ', "products": { ' .. table.concat(list_products, ', ') .. ' }'

	local list_ingredients = {}
	for x,y in pairs (b.ingredients) do
		table.insert(list_ingredients, '"' .. y.name .. '":' .. y.amount)
	end
	recipe = recipe .. ', "ingredients": { ' .. table.concat(list_ingredients, ', ') .. ' } }'
	table.insert(list_recipes, recipe)
end
write_table('recipes.txt', list_recipes)


local list_items = {}
local list_modules = {}
for a, b in pairs(game.item_prototypes) do
	local item = '"' .. b.name .. '": { }'
	table.insert(list_items, item)

	if b.module_effects then
		local module = '"' .. b.name .. '": { '
		
		local list_effects = {}
		for x,y in pairs (b.module_effects) do
			table.insert(list_effects, '"' .. x .. '":' .. y.bonus)
		end
		module = module .. '"module_effects": { ' .. table.concat(list_effects, ', ') .. ' } }'
		table.insert(list_modules, module)
	end
end
write_table('items.txt', list_items)
write_table('modules.txt', list_modules)


local list_fluids = {}
for a, b in pairs(game.fluid_prototypes) do
	fluid = '"' .. b.name .. '": { }'
	table.insert(list_fluids, fluid)
end
write_table('fluids.txt', list_fluids)


local list_machines = {}
local list_belts = {}
for a, b in pairs(game.entity_prototypes) do
	if b.crafting_categories then
		speed = b.crafting_speed
		if not speed then
			speed = 1
		end
		machine = '"' .. b.name .. '": { "speed":' .. speed

		list_categories = {}
		for c,d in pairs(b.crafting_categories) do
			table.insert(list_categories, c)
		end
		machine = machine .. ', "crafting_categories": [ "' .. table.concat(list_categories, '", "') .. '" ] }'

		table.insert(list_machines, machine)
	end

	if b.belt_speed then
		belt = '"' .. b.name .. '": { "speed":' .. b.belt_speed .. ' }'
		table.insert(list_belts, belt)
	end
end
write_table('machines.txt', list_machines)
write_table('belts.txt', list_belts)
