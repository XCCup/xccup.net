import { Model, ModelStatic } from "sequelize";
import { AirspaceInstance } from "../db/models/Airspace";
import { BrandInstance } from "../db/models/Brand";
import { ClubInstance } from "../db/models/Club";
import { FlightInstance } from "../db/models/Flight";
import { FlightCommentInstance } from "../db/models/FlightComment";
import { FlightFixesInstance } from "../db/models/FlightFixes";
import { FlightPhotoInstance } from "../db/models/FlightPhoto";
import { FlyingSiteInstance } from "../db/models/FlyingSite";
import { LogoInstance } from "../db/models/Logo";
import { NewsInstance } from "../db/models/News";
import { ProfilePictureInstance } from "../db/models/ProfilePicture";
import { ResultInstance } from "../db/models/Result";
import { SeasonDetailInstance } from "../db/models/SeasonDetail";
import { SponsorInstance } from "../db/models/Sponsor";
import { TeamInstance } from "../db/models/Team";
import { TokenInstance } from "../db/models/Token";
import { UserInstance } from "../db/models/User";
import { MessageInstance } from "../db/models/Message";

interface extendedModel<M extends Model<any, any>> extends ModelStatic<M> {
  associate?: (props: Models) => void;
}

export interface Models {
  Airspace: extendedModel<AirspaceInstance>;
  Brand: extendedModel<BrandInstance>;
  Logo: extendedModel<LogoInstance>;
  Sponsor: extendedModel<SponsorInstance>;
  Flight: extendedModel<FlightInstance>;
  Club: extendedModel<ClubInstance>;
  FlightComment: extendedModel<FlightCommentInstance>;
  FlightFixes: extendedModel<FlightFixesInstance>;
  FlightPhoto: extendedModel<FlightPhotoInstance>;
  FlyingSite: extendedModel<FlyingSiteInstance>;
  News: extendedModel<NewsInstance>;
  ProfilePicture: extendedModel<ProfilePictureInstance>;
  Result: extendedModel<ResultInstance>;
  SeasonDetail: extendedModel<SeasonDetailInstance>;
  Team: extendedModel<TeamInstance>;
  Token: extendedModel<TokenInstance>;
  User: extendedModel<UserInstance>;
  Message: extendedModel<MessageInstance>;
}
