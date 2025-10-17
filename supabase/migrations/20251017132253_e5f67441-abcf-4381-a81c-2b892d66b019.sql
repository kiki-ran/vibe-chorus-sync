-- Add sample diverse song data for ML recommendations
-- This includes multiple countries, regions, genres, and age groups

-- First, let's add some diverse songs for India
INSERT INTO public.songs (title, artist, genre, community_country, community_region, community_age_group, popularity, social_ranking) VALUES
-- Delhi
('Kesariya', 'Arijit Singh', 'Bollywood Pop', 'India', 'Delhi', '19-25', 95, 1),
('Apna Bana Le', 'Arijit Singh', 'Bollywood Romance', 'India', 'Delhi', '19-25', 92, 2),
('Chaleya', 'Arijit Singh', 'Bollywood Pop', 'India', 'Delhi', '26-40', 88, 3),
('Tum Hi Ho', 'Arijit Singh', 'Bollywood Romance', 'India', 'Delhi', '26-40', 87, 4),
('Kal Ho Naa Ho', 'Sonu Nigam', 'Bollywood Classic', 'India', 'Delhi', '40+', 90, 1),
('Tujhe Dekha To', 'Kumar Sanu', 'Bollywood Classic', 'India', 'Delhi', '40+', 89, 2),
('Besharam Rang', 'Shilpa Rao', 'Bollywood Dance', 'India', 'Delhi', '13-18', 86, 1),
('Deva Deva', 'Arijit Singh', 'Bollywood Pop', 'India', 'Delhi', '13-18', 84, 2),

-- Mumbai
('Senorita', 'Farhan Akhtar', 'Bollywood Rock', 'India', 'Mumbai', '19-25', 85, 1),
('Rock On', 'Farhan Akhtar', 'Bollywood Rock', 'India', 'Mumbai', '19-25', 83, 2),
('Dil Chahta Hai', 'Shankar Mahadevan', 'Bollywood Pop', 'India', 'Mumbai', '26-40', 88, 1),
('Kal Ho Naa Ho', 'Sonu Nigam', 'Bollywood Classic', 'India', 'Mumbai', '40+', 90, 1),
('Zingat', 'Ajay-Atul', 'Marathi Folk', 'India', 'Mumbai', '19-25', 82, 3),
('Sairat Jhala Ji', 'Ajay Gogavale', 'Marathi Folk', 'India', 'Mumbai', '26-40', 80, 2),

-- Bengaluru
('Kannalli Naane', 'V Harikrishna', 'Kannada Pop', 'India', 'Bengaluru', '19-25', 78, 1),
('Hesaru Thapade', 'Sonu Nigam', 'Kannada Melody', 'India', 'Bengaluru', '26-40', 76, 1),
('Yeno Agide', 'Shreya Ghoshal', 'Kannada Romance', 'India', 'Bengaluru', '19-25', 75, 2),
('Hudugaata', 'Raghu Dixit', 'Kannada Folk', 'India', 'Bengaluru', '26-40', 74, 2),

-- Chennai
('Arabic Kuthu', 'Anirudh Ravichander', 'Tamil Dance', 'India', 'Chennai', '13-18', 94, 1),
('Vaathi Coming', 'Anirudh Ravichander', 'Tamil Dance', 'India', 'Chennai', '19-25', 91, 1),
('Ennodu Nee Irundhaal', 'Sid Sriram', 'Tamil Melody', 'India', 'Chennai', '26-40', 87, 1),
('Thalli Pogathey', 'A.R. Rahman', 'Tamil Melody', 'India', 'Chennai', '26-40', 85, 2),
('Munbe Vaa', 'A.R. Rahman', 'Tamil Classic', 'India', 'Chennai', '40+', 88, 1),

-- Hyderabad
('Butta Bomma', 'Armaan Malik', 'Telugu Pop', 'India', 'Hyderabad', '19-25', 89, 1),
('Samajavaragamana', 'Sid Sriram', 'Telugu Melody', 'India', 'Hyderabad', '26-40', 86, 1),
('Ramuloo Ramulaa', 'Anirudh Ravichander', 'Telugu Dance', 'India', 'Hyderabad', '13-18', 85, 1),
('Inkem Inkem', 'Sid Sriram', 'Telugu Romance', 'India', 'Hyderabad', '19-25', 84, 2),

-- Pune
('Zingaat', 'Ajay-Atul', 'Marathi Dance', 'India', 'Pune', '19-25', 87, 1),
('Apsara Aali', 'Shreya Ghoshal', 'Marathi Folk', 'India', 'Pune', '26-40', 83, 1),
('Kombdi Palali', 'Ajay-Atul', 'Marathi Folk', 'India', 'Pune', '13-18', 80, 1),

-- Calicut
('Manike', 'Yohani', 'Malayalam Pop', 'India', 'Calicut', '19-25', 82, 1),
('Kannil Pettole', 'Shreya Ghoshal', 'Malayalam Melody', 'India', 'Calicut', '26-40', 79, 1),
('Aanandam Paramanandam', 'K.J. Yesudas', 'Malayalam Classic', 'India', 'Calicut', '40+', 81, 1),

-- USA Songs
('Flowers', 'Miley Cyrus', 'Pop', 'USA', 'New York', '19-25', 96, 1),
('Anti-Hero', 'Taylor Swift', 'Pop', 'USA', 'New York', '19-25', 94, 2),
('As It Was', 'Harry Styles', 'Pop Rock', 'USA', 'Los Angeles', '19-25', 93, 1),
('Blinding Lights', 'The Weeknd', 'Synth Pop', 'USA', 'Los Angeles', '26-40', 92, 1),
('Shape of You', 'Ed Sheeran', 'Pop', 'USA', 'New York', '26-40', 91, 3),
('Bohemian Rhapsody', 'Queen', 'Rock', 'USA', 'Chicago', '40+', 98, 1),
('Stairway to Heaven', 'Led Zeppelin', 'Rock', 'USA', 'Chicago', '40+', 97, 2),
('Levitating', 'Dua Lipa', 'Disco Pop', 'USA', 'Miami', '13-18', 90, 1),
('Good 4 U', 'Olivia Rodrigo', 'Pop Rock', 'USA', 'Los Angeles', '13-18', 89, 1),
('Stay', 'The Kid LAROI', 'Pop', 'USA', 'New York', '13-18', 88, 2),

-- UK Songs
('Someone Like You', 'Adele', 'Soul Pop', 'UK', 'London', '26-40', 95, 1),
('Shivers', 'Ed Sheeran', 'Pop', 'UK', 'London', '19-25', 92, 1),
('Bad Habits', 'Ed Sheeran', 'Dance Pop', 'UK', 'London', '19-25', 90, 2),
('Wonderwall', 'Oasis', 'Britpop', 'UK', 'Manchester', '40+', 94, 1),
('Don''t Start Now', 'Dua Lipa', 'Disco Pop', 'UK', 'London', '19-25', 89, 3),
('Rollin', 'Calvin Harris', 'Electronic', 'UK', 'London', '13-18', 86, 1),

-- Japan Songs
('Gurenge', 'LiSA', 'J-Pop', 'Japan', 'Tokyo', '13-18', 93, 1),
('Homura', 'LiSA', 'J-Pop', 'Japan', 'Tokyo', '19-25', 91, 1),
('Pretender', 'Official HIGE DANdism', 'J-Rock', 'Japan', 'Tokyo', '19-25', 89, 2),
('Lemon', 'Kenshi Yonezu', 'J-Pop', 'Japan', 'Tokyo', '26-40', 90, 1),
('First Love', 'Utada Hikaru', 'J-Pop', 'Japan', 'Tokyo', '40+', 92, 1),
('Sakura', 'Ikimono Gakari', 'J-Pop', 'Japan', 'Osaka', '26-40', 87, 1),

-- South Korea Songs
('Dynamite', 'BTS', 'K-Pop', 'South Korea', 'Seoul', '13-18', 98, 1),
('Butter', 'BTS', 'K-Pop', 'South Korea', 'Seoul', '19-25', 97, 1),
('Pink Venom', 'BLACKPINK', 'K-Pop', 'South Korea', 'Seoul', '13-18', 96, 2),
('Shut Down', 'BLACKPINK', 'K-Pop', 'South Korea', 'Seoul', '19-25', 95, 2),
('Gangnam Style', 'PSY', 'K-Pop', 'South Korea', 'Seoul', '40+', 94, 1),
('That That', 'PSY', 'K-Pop', 'South Korea', 'Seoul', '26-40', 90, 1),

-- France Songs
('La Vie en Rose', 'Édith Piaf', 'French Chanson', 'France', 'Paris', '40+', 95, 1),
('Dernière Danse', 'Indila', 'French Pop', 'France', 'Paris', '26-40', 88, 1),
('Bijou', 'Lala &ce', 'French Hip-Hop', 'France', 'Paris', '19-25', 85, 1),
('Stromae - Alors on danse', 'Stromae', 'Electronic', 'France', 'Paris', '19-25', 87, 2),
('Papaoutai', 'Stromae', 'Electronic', 'France', 'Paris', '26-40', 86, 2),
('Formidable', 'Stromae', 'Electronic', 'France', 'Paris', '13-18', 84, 1);

-- Add more diverse genres across regions
INSERT INTO public.songs (title, artist, genre, community_country, community_region, community_age_group, popularity, social_ranking) VALUES
-- Indie/Alternative
('Electric Feel', 'MGMT', 'Indie Rock', 'USA', 'Portland', '19-25', 86, 1),
('Take Me Out', 'Franz Ferdinand', 'Indie Rock', 'UK', 'Glasgow', '26-40', 85, 1),
('Riptide', 'Vance Joy', 'Indie Pop', 'USA', 'Austin', '19-25', 84, 1),

-- Hip-Hop
('Sicko Mode', 'Travis Scott', 'Hip-Hop', 'USA', 'Houston', '19-25', 91, 1),
('God''s Plan', 'Drake', 'Hip-Hop', 'USA', 'Toronto', '19-25', 90, 2),
('HUMBLE.', 'Kendrick Lamar', 'Hip-Hop', 'USA', 'Los Angeles', '26-40', 89, 2),

-- Classical/Jazz
('Clair de Lune', 'Claude Debussy', 'Classical', 'France', 'Paris', '40+', 92, 2),
('Four Seasons - Spring', 'Antonio Vivaldi', 'Classical', 'UK', 'London', '40+', 91, 2),
('Take Five', 'Dave Brubeck', 'Jazz', 'USA', 'New York', '40+', 88, 3),

-- Electronic/EDM
('Titanium', 'David Guetta', 'EDM', 'France', 'Paris', '19-25', 88, 3),
('Wake Me Up', 'Avicii', 'EDM', 'USA', 'Las Vegas', '19-25', 87, 1),
('Levels', 'Avicii', 'EDM', 'USA', 'Las Vegas', '26-40', 86, 1);