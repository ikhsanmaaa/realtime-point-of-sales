-- Optional: Clear existing data
TRUNCATE TABLE public.menus RESTART IDENTITY CASCADE;

INSERT INTO public.menus
(name, description, price, discount, image_url, category, is_available)
VALUES

-- ☕ COFFEE
('Espresso', 'Strong and bold single shot espresso made from premium beans.', 25000, 0, 'https://images.unsplash.com/photo-espresso', 'Coffee', true),
('Americano', 'Espresso diluted with hot water for a smoother taste.', 28000, 0.05, 'https://images.unsplash.com/photo-americano', 'Coffee', true),
('Cappuccino', 'Espresso with steamed milk and thick foam.', 35000, 0.10, 'https://images.unsplash.com/photo-cappuccino', 'Coffee', true),
('Caffe Latte', 'Smooth espresso with creamy steamed milk.', 38000, 0.05, 'https://images.unsplash.com/photo-latte', 'Coffee', true),
('Caramel Macchiato', 'Vanilla latte topped with caramel drizzle.', 42000, 0.15, 'https://images.unsplash.com/photo-macchiato', 'Coffee', true),
('Mocha', 'Chocolate flavored latte with whipped cream.', 40000, 0.10, 'https://images.unsplash.com/photo-mocha', 'Coffee', true),

-- 🧋 NON-COFFEE
('Matcha Latte', 'Premium Japanese matcha with fresh milk.', 40000, 0.10, 'https://images.unsplash.com/photo-matcha', 'Non-Coffee', true),
('Chocolate Frappe', 'Blended chocolate drink with whipped cream.', 45000, 0, 'https://images.unsplash.com/photo-frappe', 'Non-Coffee', true),
('Fresh Lemon Tea', 'Refreshing iced lemon tea.', 28000, 0, 'https://images.unsplash.com/photo-lemontea', 'Non-Coffee', true),
('Strawberry Smoothie', 'Fresh strawberry blended with yogurt.', 42000, 0.05, 'https://images.unsplash.com/photo-smoothie', 'Non-Coffee', true),

-- 🥐 BREAKFAST
('Butter Croissant', 'Flaky French butter croissant.', 30000, 0, 'https://images.unsplash.com/photo-croissant', 'Breakfast', true),
('Avocado Toast', 'Sourdough toast with smashed avocado & poached egg.', 55000, 0.10, 'https://images.unsplash.com/photo-avocadotoast', 'Breakfast', true),
('Pancake Stack', 'Fluffy pancakes with maple syrup & berries.', 50000, 0.05, 'https://images.unsplash.com/photo-pancake', 'Breakfast', true),
('Omelette Cheese', 'Three-egg omelette with melted cheese.', 45000, 0, 'https://images.unsplash.com/photo-omelette', 'Breakfast', true),

-- 🍝 MAIN COURSE
('Spaghetti Carbonara', 'Creamy pasta with beef bacon and parmesan.', 65000, 0.10, 'https://images.unsplash.com/photo-carbonara', 'Main Course', true),
('Chicken Teriyaki Bowl', 'Grilled chicken with teriyaki sauce over rice.', 60000, 0, 'https://images.unsplash.com/photo-teriyaki', 'Main Course', true),
('Beef Burger Deluxe', 'Juicy beef patty with cheese & special sauce.', 70000, 0.15, 'https://images.unsplash.com/photo-burger', 'Main Course', true),
('Grilled Salmon', 'Pan-seared salmon with lemon butter sauce.', 85000, 0.05, 'https://images.unsplash.com/photo-salmon', 'Main Course', true),

-- 🍰 DESSERT
('Tiramisu', 'Classic Italian dessert with mascarpone.', 45000, 0.10, 'https://images.unsplash.com/photo-tiramisu', 'Dessert', true),
('Cheesecake', 'Creamy baked cheesecake with strawberry topping.', 48000, 0.05, 'https://images.unsplash.com/photo-cheesecake', 'Dessert', true),
('Chocolate Lava Cake', 'Warm chocolate cake with molten center.', 50000, 0.10, 'https://images.unsplash.com/photo-lavacake', 'Dessert', false),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate syrup.', 35000, 0, 'https://images.unsplash.com/photo-sundae', 'Dessert', true);