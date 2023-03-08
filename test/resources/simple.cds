using {cuid} from '@sap/cds/common';

context custom {
  context a {
    entity A : cuid {
      Name : String(255) not null;
      Age  : Integer default 18;
    }
  }

  context b {
    entity B : cuid {
      Amount : Decimal(20, 6);
      Total  : Decimal(21, 6);
    }

    context c {
      entity C : cuid {
        Name : String(255);
        b    : Association to one B;
      }
    }
  }
}
