import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

const InvestorCTA = () => (
  <section className="py-20 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl text-center">
      <div className="gold-divider mb-12" />
      <h2 className="font-display text-3xl font-semibold text-foreground mb-4">
        The future of marketing will not hire agencies.
      </h2>
      <p className="text-lg text-foreground font-medium mb-8">
        It will deploy operators. Matango.ai is defining that category.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/contact?type=investor">
            Request Investor Information <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/contact">
            <Mail className="h-4 w-4 mr-2" /> Contact the Team
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default InvestorCTA;
