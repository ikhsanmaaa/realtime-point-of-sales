insert into public.tables
(name, description, capacity, status, floor, position_x, position_y)
values
-- ROW 1
('1F-01', 'Near window', 2, 'available', '1F', 100, 100),
('1F-02', 'Center area', 4, 'available', '1F', 350, 100),
('1F-03', 'Center area', 4, 'reserved',  '1F', 600, 100),
('1F-04', 'Corner seat', 2, 'available', '1F', 850, 100),

-- ROW 2
('1F-05', 'Family table', 6, 'available', '1F', 100, 280),
('1F-06', 'Big group',    8, 'available', '1F', 350, 280),
('1F-07', 'Big group',    8, 'unavailable','1F', 600, 280),
('1F-08', 'Family table', 6, 'available', '1F', 850, 280);