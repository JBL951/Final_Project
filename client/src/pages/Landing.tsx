import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChefHat, Heart, Users, Utensils } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: ChefHat,
      title: "Professional Recipes",
      description: "Craft beautiful recipes that feel like home — with rich photos, easy steps, and chef-level detail."
    },
    {
      icon: Heart,
      title: "Passionate Community",
      description: "Share kitchen wisdom, spark friendships, and inspire others with your culinary adventures."
    },
    {
      icon: Utensils,
      title: "Smart Organization",
      description: "Keep your recipes organized with categories, tags, and a powerful search system."
    },
    {
      icon: Users,
      title: "Social Experience",
      description: "Engage with the community through likes, comments, and real-time updates."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/5"/>
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="sm:text-center lg:text-left"
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Share Your Culinary
                  </span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Masterpieces
                  </span>
                </h1>
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-300 font-medium sm:max-w-xl sm:mx-auto lg:mx-0">
                  The all-in-one platform to create, organize, and explore recipes with food lovers around the world.
                </p>
                <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join our passionate community of food enthusiasts. Discover extraordinary recipes, share your signature dishes, and explore the art of cooking together.
                </p>
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Link href="/recipes" className="block w-full">
                      <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                        <ChefHat className="mr-2 h-5 w-5" />
                        Explore Recipes
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Link href="/auth" className="block w-full">
                      <Button size="lg" variant="outline" className="w-full border-2 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300">
                        <Users className="mr-2 h-5 w-5" />
                        Join Community
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </main>
          </div>
        </div>

        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-black/30 rounded-lg" />
              <img
                className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-lg shadow-2xl"
                src="https://images.unsplash.com/photo-1543340904-0b1d843bccda?auto=format&fit=crop&w=2000&q=80"
                alt="Cooking"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:text-center"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Elevate Your Culinary Journey
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 lg:mx-auto">
              Everything you need to create, share, and discover exceptional recipes.
            </p>
          </motion.div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-rose-400 to-orange-300 text-white shadow-lg">
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <feature.icon className="h-6 w-6" />
                        </motion.div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto px-4"
        >
          <p className="italic text-xl text-gray-600 dark:text-gray-300">
            "TasteBase has completely changed how I organize and share recipes with my friends. It's like Pinterest, but for real chefs."  
          </p>
          <p className="mt-4 font-semibold text-gray-700 dark:text-white">— Lindiwe, Home Chef</p>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70" />
        <div className="relative max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Start Your Culinary Adventure</span>
              <span className="block">Join TasteBase Today</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-white/90">
              Create your account and become part of our growing community of passionate food enthusiasts.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8"
            >
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
