
/**
 * @fileOverview Centralized database of all possible dishes the kitchen can prepare.
 */

export interface DishOption {
  id: string;
  name: string;
  description: string;
  image: string; // Will now be a path to a local image, e.g., /images/menu/dish-id.png
  aiHint: string;
}

export const dishDatabase: Record<string, DishOption[]> = {
  "Main Course - Vegetarian": [
    { id: "mc_veg_1", name: "Dal Makhani", description: "Rich and creamy black lentils and kidney beans.", image: "/images/menu/mc_veg_1.png", aiHint: "lentil curry" },
    { id: "mc_veg_2", name: "Shahi Paneer", description: "Creamy cottage cheese curry with a rich Mughlai gravy.", image: "/images/menu/mc_veg_2.png", aiHint: "paneer curry" },
    { id: "mc_veg_3", name: "Paneer Butter Masala", description: "Creamy tomato-based curry with soft paneer cubes.", image: "/images/menu/mc_veg_3.png", aiHint: "paneer masala" },
    { id: "mc_veg_4", name: "Palak Paneer", description: "Cottage cheese in a smooth spinach gravy.", image: "/images/menu/mc_veg_4.png", aiHint: "spinach paneer" },
  ],
  "Main Course - Non-Vegetarian": [
    { id: "mc_nonveg_1", name: "Chicken Tikka Masala", description: "Grilled chicken chunks in a spiced curry sauce.", image: "/images/menu/mc_nonveg_1.png", aiHint: "chicken curry" },
    { id: "mc_nonveg_2", name: "Butter Chicken", description: "Mildly spiced chicken curry in a buttery tomato sauce.", image: "/images/menu/mc_nonveg_2.png", aiHint: "butter chicken" },
  ],
  "Breads": [
    { id: "b_1", name: "Tandoori Roti", description: "Whole wheat bread baked in a tandoor.", image: "/images/menu/b_1.png", aiHint: "roti bread" },
    { id: "b_2", name: "Missi Roti", description: "Savory flatbread made with gram flour and spices.", image: "/images/menu/b_2.png", aiHint: "missi roti" },
    { id: "b_3", name: "Naan", description: "Leavened, oven-baked flatbread.", image: "/images/menu/b_3.png", aiHint: "naan bread" },
  ],
  "Rice": [
    { id: "r_1", name: "Vegetable Pulao", description: "Aromatic rice cooked with mixed vegetables and spices.", image: "/images/menu/r_1.png", aiHint: "pulao rice" },
    { id: "r_2", name: "Veg Biryani", description: "Flavorful rice dish with mixed vegetables and aromatic spices.", image: "/images/menu/r_2.png", aiHint: "veg biryani" },
    { id: "r_3", name: "Chicken Biryani", description: "Aromatic basmati rice cooked with chicken and spices.", image: "/images/menu/r_3.png", aiHint: "chicken biryani" },
  ],
  "Sweet Dish": [
    { id: "s_1", name: "Gulab Jamun", description: "Soft, melt-in-your-mouth milk-solid balls in sugar syrup.", image: "/images/menu/s_1.png", aiHint: "indian dessert" },
    { id: "s_2", name: "Shahi Tukda", description: "Rich bread pudding with nuts and saffron.", image: "/images/menu/s_2.png", aiHint: "bread pudding" },
    { id: "s_3", name: "Kheer", description: "Traditional Indian rice pudding.", image: "/images/menu/s_3.png", aiHint: "rice pudding" },
  ],
};

// Flattened list of all dish names available in the kitchen
export const allAvailableDishNames: string[] = Object.values(dishDatabase).flat().map(dish => dish.name);

// You can also export a list of dish objects if more detail is needed by the AI
export const allAvailableDishes: DishOption[] = Object.values(dishDatabase).flat();
