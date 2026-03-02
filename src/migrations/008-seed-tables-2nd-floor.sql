insert into public.tables
(name, description, capacity, status, floor, position_x, position_y)
values
-- ROW 1
('2F-01', 'Balcony side', 4, 'available', '2F', 100, 100),
('2F-02', 'Balcony side', 4, 'reserved',  '2F', 350, 100),
('2F-03', 'Small table',  2, 'available', '2F', 600, 100),
('2F-04', 'Small table',  2, 'available', '2F', 850, 100),

-- ROW 2
('2F-05', 'Group table',  8, 'available', '2F', 100, 280),
('2F-06', 'Family table', 6, 'available', '2F', 350, 280),
('2F-07', 'Family table', 6, 'reserved',  '2F', 600, 280),
('2F-08', 'Group table',  8, 'available', '2F', 850, 280);