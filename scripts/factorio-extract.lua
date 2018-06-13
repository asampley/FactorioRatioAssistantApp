/silent-command

to_json = function (t, keyset, tabs)
	if tabs == nil then tabs = 0 end

	local json = {}
	local newline = '\r\n' .. string.rep('\t', tabs)

	if type(t) ~= 'table' and type(t) ~= 'userdata' then
		if type(t) == 'string' then
			return '"' .. tostring(t) .. '"'
		else
			return tostring(t)
		end
	end

	local is_array = type(t) == 'table' and #t ~= 0
	local is_userdata = type(t) == 'userdata'

	if is_array then
		for _,v in pairs(t) do
			local json_element = to_json(v, keyset, tabs + 1)
			if json_element then
				table.insert(json, "" .. json_element)
			end
		end
	else
		if type(keyset) == 'table' or is_userdata then
			local required_keys = true
			for k,v in pairs(keyset) do
				if v and t[k] == nil then required_keys = false break end
			end
			if required_keys then
				for k,v in pairs(keyset) do
					local json_element = to_json(t[k], v, tabs + 1)
					if json_element then
						table.insert(json, '"' .. k .. '":' .. json_element)
					end
				end
			end
		else
			for k,v in pairs(t) do
				local json_element = to_json(v, nil, tabs + 1)
				if json_element then
					table.insert(json, '"' .. k .. '":' .. json_element)
				end
			end
		end

	end

	if #json == 0 then
		return nil
	end

	local str = table.concat(json, ',' .. newline .. '\t')

	local brackets = {}
	if is_array then
		brackets = {'[', ']'}
	else
		brackets = {'{', '}'}
	end
	if #json > 1 then
		return brackets[1] .. newline .. '\t' .. str .. newline .. brackets[2]
	else
		return brackets[1] .. str .. brackets[2]
	end
end


local recipes = to_json(game.recipe_prototypes, { 
	name = true, 
	energy = true, 
	category = true, 
	products = { 
		name = true, 
		amount = true },
	ingredients = { 
		name = true, 
		amount = true }
})
game.write_file('recipes.json', recipes)

local items = to_json(game.item_prototypes, { 
	name = true
})
game.write_file('items.json', items)

local modules = to_json(game.item_prototypes, {
	name = true,
	module_effects = true
})
game.write_file('modules.json', modules)

local fluids = to_json(game.fluid_prototypes, {
	name = true
})
game.write_file('fluids.json', fluids)

local machines = to_json(game.entity_prototypes, {
	name = true,
	crafting_speed = true,
	crafting_categories = true
})
game.write_file('machines.json', machines)

local belts = to_json(game.entity_prototypes, {
	name = true,
	belt_speed = true
})
game.write_file('belts.json', belts)
